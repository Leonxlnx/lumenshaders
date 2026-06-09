/* Minimal dependency-free WebM (Matroska) muxer for WebCodecs output.
   Takes encoded VP8/VP9 chunks and produces a playable .webm file. */

var WebMMux = (function () {

  function concat(arrays) {
    var total = 0;
    for (var i = 0; i < arrays.length; i++) total += arrays[i].length;
    var out = new Uint8Array(total);
    var o = 0;
    for (var j = 0; j < arrays.length; j++) { out.set(arrays[j], o); o += arrays[j].length; }
    return out;
  }

  /* EBML element IDs are written verbatim (big-endian) */
  function idBytes(id) {
    var bytes = [];
    while (id > 0) { bytes.unshift(id & 0xff); id = Math.floor(id / 256); }
    return new Uint8Array(bytes);
  }

  /* EBML data-size vint */
  function sizeBytes(n) {
    if (n < 0x7F) return new Uint8Array([0x80 | n]);
    if (n < 0x3FFF) return new Uint8Array([0x40 | (n >> 8), n & 0xff]);
    if (n < 0x1FFFFF) return new Uint8Array([0x20 | (n >> 16), (n >> 8) & 0xff, n & 0xff]);
    if (n < 0x0FFFFFFF) return new Uint8Array([0x10 | (n >> 24), (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]);
    /* up to ~1TB, plenty for any export */
    var hi = Math.floor(n / 0x100000000);
    return new Uint8Array([0x08 | hi, (n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
  }

  function el(id, payload) {
    return concat([idBytes(id), sizeBytes(payload.length), payload]);
  }

  function uintPayload(n) {
    var bytes = [];
    do { bytes.unshift(n & 0xff); n = Math.floor(n / 256); } while (n > 0);
    return new Uint8Array(bytes);
  }

  function strPayload(s) {
    var out = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0x7f;
    return out;
  }

  function float8Payload(d) {
    var buf = new ArrayBuffer(8);
    new DataView(buf).setFloat64(0, d, false);
    return new Uint8Array(buf);
  }

  /* frames: [{ data: Uint8Array, timestampMs: number, key: boolean }] */
  function mux(opts) {
    var codecId = opts.codecId;     // "V_VP8" | "V_VP9"
    var w = opts.width, h = opts.height;
    var durationMs = opts.durationMs;
    var frames = opts.frames;

    var header = el(0x1A45DFA3, concat([
      el(0x4286, uintPayload(1)),       // EBMLVersion
      el(0x42F7, uintPayload(1)),       // EBMLReadVersion
      el(0x42F2, uintPayload(4)),       // EBMLMaxIDLength
      el(0x42F3, uintPayload(8)),       // EBMLMaxSizeLength
      el(0x4282, strPayload("webm")),   // DocType
      el(0x4287, uintPayload(2)),       // DocTypeVersion
      el(0x4285, uintPayload(2))        // DocTypeReadVersion
    ]));

    var info = el(0x1549A966, concat([
      el(0x2AD7B1, uintPayload(1000000)),       // TimecodeScale: 1ms
      el(0x4489, float8Payload(durationMs)),    // Duration
      el(0x4D80, strPayload("lumen")),          // MuxingApp
      el(0x5741, strPayload("lumen"))           // WritingApp
    ]));

    var tracks = el(0x1654AE6B, el(0xAE, concat([
      el(0xD7, uintPayload(1)),                 // TrackNumber
      el(0x73C5, uintPayload(1)),               // TrackUID
      el(0x83, uintPayload(1)),                 // TrackType: video
      el(0x9C, uintPayload(0)),                 // FlagLacing
      el(0x86, strPayload(codecId)),            // CodecID
      el(0xE0, concat([                         // Video
        el(0xB0, uintPayload(w)),               // PixelWidth
        el(0xBA, uintPayload(h))                // PixelHeight
      ]))
    ])));

    /* clusters: start a new one every second (relative timecode is int16 ms) */
    var clusters = [];
    var blocks = [];
    var clusterTc = 0;

    function flushCluster() {
      if (!blocks.length) return;
      clusters.push(el(0x1F43B675, concat(
        [el(0xE7, uintPayload(clusterTc))].concat(blocks)
      )));
      blocks = [];
    }

    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      var tc = Math.round(f.timestampMs);
      if (!blocks.length) clusterTc = tc;
      else if (tc - clusterTc > 1000 || (f.key && tc !== clusterTc)) {
        flushCluster();
        clusterTc = tc;
      }
      var rel = tc - clusterTc;
      var head = new Uint8Array(4);
      head[0] = 0x81;                            // track 1 (vint)
      head[1] = (rel >> 8) & 0xff;
      head[2] = rel & 0xff;
      head[3] = f.key ? 0x80 : 0x00;             // flags
      blocks.push(el(0xA3, concat([head, f.data])));  // SimpleBlock
    }
    flushCluster();

    var segment = el(0x18538067, concat([info, tracks].concat(clusters)));
    return concat([header, segment]);
  }

  return { mux: mux };
})();
