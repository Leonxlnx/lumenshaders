/* Export pipeline: PNG stills, WebM/MP4 video, looping GIF. */

var Exporter = (function () {
  var cancelled = false;
  var busy = false;

  function $(id) { return document.getElementById(id); }

  function showOverlay(title) {
    cancelled = false;
    $("overlay-title").textContent = title;
    $("overlay-detail").textContent = "preparing";
    $("overlay-bar").style.width = "0%";
    $("overlay").hidden = false;
  }
  function setProgress(frac, detail) {
    $("overlay-bar").style.width = Math.round(frac * 100) + "%";
    if (detail) $("overlay-detail").textContent = detail;
  }
  function hideOverlay() { $("overlay").hidden = true; }

  function download(blob, name) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }

  function stamp(P, ext) {
    var mode = MODES[P.mode].key;
    return "lumen-" + mode + "-" + String(Math.round(P.seed)).padStart(4, "0") + "." + ext;
  }

  function evenRound(v) { return 2 * Math.round(v / 2); }

  /* ---------- PNG ---------- */
  function exportPNG(P, aspect) {
    if (busy) return;
    busy = true;
    var prev = Engine.size();
    var h = parseInt(P.imgRes, 10);
    var w = evenRound(h * aspect);
    Engine.setSize(w, h);
    Engine.renderAt(Engine.currentPhase());
    Engine.canvas().toBlob(function (blob) {
      Engine.setSize(prev[0], prev[1]);
      Engine.renderAt(Engine.currentPhase());
      busy = false;
      if (blob) {
        download(blob, stamp(P, "png"));
        UI.toast("Saved " + w + "\u00d7" + h + " PNG");
      }
    }, "image/png");
  }

  /* ---------- Video (WebCodecs: deterministic offline encode, no MediaRecorder) ---------- */

  function videoDurationSec(P) {
    var v = String(P.vidLen || "l2");
    if (v.charAt(0) === "s") return Math.max(1, parseInt(v.slice(1), 10) || 5);
    return P.loop * Math.max(1, parseInt(v.slice(1), 10) || 1);
  }

  function videoBitrate(w, h, fps) {
    var px = w * h;
    var base = px >= 2560 * 1440 ? 14000000 : px >= 1920 * 1080 ? 9000000 : px >= 1280 * 720 ? 6000000 : 3500000;
    return fps >= 60 ? Math.round(base * 1.4) : base;
  }

  async function pickEncoderConfig(w, h, fps) {
    var candidates = [
      { codec: "vp09.00.10.08", codecId: "V_VP9" },
      { codec: "vp8", codecId: "V_VP8" }
    ];
    for (var i = 0; i < candidates.length; i++) {
      var cfg = {
        codec: candidates[i].codec,
        width: w, height: h,
        bitrate: videoBitrate(w, h, fps),
        framerate: fps
      };
      try {
        var sup = await VideoEncoder.isConfigSupported(cfg);
        if (sup && sup.supported) return { config: cfg, codecId: candidates[i].codecId };
      } catch (e) { /* try next codec */ }
    }
    return null;
  }

  async function exportVideo(P, aspect) {
    if (busy) return;
    if (typeof VideoEncoder === "undefined" || typeof VideoFrame === "undefined") {
      UI.toast("This browser has no WebCodecs support, use a current Chrome, Edge or Firefox");
      return;
    }
    busy = true;

    var prev = Engine.size();
    var wasPlaying = Engine.isPlaying();
    var h = parseInt(P.vidRes, 10);
    var w = evenRound(h * aspect);
    var fps = parseInt(P.vidFps, 10) || 30;
    var totalSec = videoDurationSec(P);
    var nFrames = Math.max(2, Math.round(totalSec * fps));

    showOverlay("Rendering video");
    Engine.suspend();
    Engine.setPlaying(false);
    Engine.setSize(w, h);

    var picked = await pickEncoderConfig(w, h, fps);
    if (!picked) {
      restore();
      UI.toast("No supported video codec (VP9/VP8) found");
      return;
    }

    var encFrames = [];
    var encError = null;
    var encoder = new VideoEncoder({
      output: function (chunk) {
        var data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        encFrames.push({
          data: data,
          timestampMs: chunk.timestamp / 1000,
          key: chunk.type === "key"
        });
      },
      error: function (e) { encError = e; }
    });
    encoder.configure(picked.config);

    var canvas = Engine.canvas();
    var usPerFrame = 1e6 / fps;

    try {
      for (var f = 0; f < nFrames; f++) {
        if (cancelled || encError) break;

        var t = f / fps;
        Engine.setLoopTime(t % P.loop);
        Engine.renderAt((t % P.loop) / P.loop);

        var vf = new VideoFrame(canvas, {
          timestamp: Math.round(f * usPerFrame),
          duration: Math.round(usPerFrame)
        });
        /* keyframe every 2 seconds keeps files small and seekable */
        encoder.encode(vf, { keyFrame: f % (fps * 2) === 0 });
        vf.close();

        setProgress(0.9 * (f + 1) / nFrames,
          "frame " + (f + 1) + "/" + nFrames + " \u00b7 " + w + "\u00d7" + h + " @ " + fps + "fps");

        /* backpressure: never let the encoder queue grow unbounded */
        while (encoder.encodeQueueSize > 2) await wait(2);
        if (f % 8 === 7) await wait(0);
      }

      if (!cancelled && !encError) {
        setProgress(0.93, "finalizing encode");
        await encoder.flush();
      }
    } catch (e) {
      encError = e;
    }

    try { encoder.close(); } catch (ignore) {}

    /* restore live view before the (fast) muxing step */
    Engine.setSize(prev[0], prev[1]);
    Engine.setPlaying(wasPlaying);
    Engine.resume();

    if (cancelled) { hideOverlay(); busy = false; return; }
    if (encError || !encFrames.length) {
      hideOverlay(); busy = false;
      UI.toast("Video encode failed" + (encError && encError.message ? ": " + encError.message : ""));
      return;
    }

    setProgress(0.97, "writing webm container");
    await wait(0);
    var webm = WebMMux.mux({
      codecId: picked.codecId,
      width: w, height: h,
      durationMs: totalSec * 1000,
      frames: encFrames
    });

    hideOverlay();
    busy = false;
    download(new Blob([webm], { type: "video/webm" }), stamp(P, "webm"));
    UI.toast("Saved " + totalSec.toFixed(1) + "s WEBM \u00b7 " + nFrames + " frames \u00b7 " + w + "\u00d7" + h + " @ " + fps + "fps");

    function restore() {
      Engine.setSize(prev[0], prev[1]);
      Engine.setPlaying(wasPlaying);
      Engine.resume();
      hideOverlay();
      busy = false;
    }
  }

  /* ---------- GIF (offline, deterministic, perfect loop) ---------- */
  async function exportGIF(P, aspect) {
    if (busy) return;
    busy = true;

    var prev = Engine.size();
    var wasPlaying = Engine.isPlaying();
    Engine.setPlaying(false);

    var w = parseInt(P.gifW, 10);
    var h = evenRound(w / aspect);
    var fps = parseInt(P.gifFps, 10);
    var nFrames = Math.max(2, Math.round(P.loop * fps));

    showOverlay("Rendering GIF");
    Engine.setSize(w, h);

    var frames = [];
    for (var f = 0; f < nFrames; f++) {
      if (cancelled) break;
      Engine.renderAt(f / nFrames);
      frames.push(Engine.readPixels());
      setProgress(0.4 * (f + 1) / nFrames, "capturing " + (f + 1) + "/" + nFrames);
      if (f % 4 === 3) await wait(0);
    }

    Engine.setSize(prev[0], prev[1]);
    Engine.setPlaying(wasPlaying);

    if (cancelled) { hideOverlay(); busy = false; return; }

    var data = await GIFEnc.encode({
      frames: frames, width: w, height: h, fps: fps,
      dither: P.gifDither, loop: P.gifLoop,
      onProgress: function (frac, detail) { setProgress(0.4 + 0.6 * frac, "encoding \u00b7 " + detail); },
      isCancelled: function () { return cancelled; }
    });

    hideOverlay();
    busy = false;
    if (data && !cancelled) {
      download(new Blob([data], { type: "image/gif" }), stamp(P, "gif"));
      UI.toast("Saved " + nFrames + "-frame looping GIF (" + w + "\u00d7" + h + ")");
    }
  }

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  document.addEventListener("DOMContentLoaded", function () {
    $("overlay-cancel").addEventListener("click", function () { cancelled = true; });
  });

  return {
    exportPNG: exportPNG,
    exportVideo: exportVideo,
    exportGIF: exportGIF,
    isBusy: function () { return busy; }
  };
})();
