SDCardController = function(t, e, i) {
  i.d(e, {
      M: function() {
          return m
      }
  });
  var s = i(59499);
  const BYTELIST = [0, 4129, 8258, 12387, 16516, 20645, 24774, 28903, 33032, 37161, 41290, 45419, 49548, 53677, 57806, 61935, 4657, 528, 12915, 8786, 21173, 17044, 29431, 25302, 37689, 33560, 45947, 41818, 54205, 50076, 62463, 58334, 9314, 13379, 1056, 5121, 25830, 29895, 17572, 21637, 42346, 46411, 34088, 38153, 58862, 62927, 50604, 54669, 13907, 9842, 5649, 1584, 30423, 26358, 22165, 18100, 46939, 42874, 38681, 34616, 63455, 59390, 55197, 51132, 18628, 22757, 26758, 30887, 2112, 6241, 10242, 14371, 51660, 55789, 59790, 63919, 35144, 39273, 43274, 47403, 23285, 19156, 31415, 27286, 6769, 2640, 14899, 10770, 56317, 52188, 64447, 60318, 39801, 35672, 47931, 43802, 27814, 31879, 19684, 23749, 11298, 15363, 3168, 7233, 60846, 64911, 52716, 56781, 44330, 48395, 36200, 40265, 32407, 28342, 24277, 20212, 15891, 11826, 7761, 3696, 65439, 61374, 57309, 53244, 48923, 44858, 40793, 36728, 37256, 33193, 45514, 41451, 53516, 49453, 61774, 57711, 4224, 161, 12482, 8419, 20484, 16421, 28742, 24679, 33721, 37784, 41979, 46042, 49981, 54044, 58239, 62302, 689, 4752, 8947, 13010, 16949, 21012, 25207, 29270, 46570, 42443, 38312, 34185, 62830, 58703, 54572, 50445, 13538, 9411, 5280, 1153, 29798, 25671, 21540, 17413, 42971, 47098, 34713, 38840, 59231, 63358, 50973, 55100, 9939, 14066, 1681, 5808, 26199, 30326, 17941, 22068, 55628, 51565, 63758, 59695, 39368, 35305, 47498, 43435, 22596, 18533, 30726, 26663, 6336, 2273, 14466, 10403, 52093, 56156, 60223, 64286, 35833, 39896, 43963, 48026, 19061, 23124, 27191, 31254, 2801, 6864, 10931, 14994, 64814, 60687, 56684, 52557, 48554, 44427, 40424, 36297, 31782, 27655, 23652, 19525, 15522, 11395, 7392, 3265, 61215, 65342, 53085, 57212, 44955, 49082, 36825, 40952, 28183, 32310, 20053, 24180, 11923, 16050, 3793, 7920];
  function a_BYTELIST(t) {
      let e = 0;
      for (let i = 0; i < t.length; i++)
          e = BYTELIST[255 & (e >> 8 ^ t[i])] ^ e << 8;
      return 65535 & e
  }
  const r = 512;
  var o, c, l, h, d;
  !function(t) {
      t[t.Ready = 0] = "Ready",
      t[t.Command = 1] = "Command",
      t[t.Write = 2] = "Write",
      t[t.WriteData = 3] = "WriteData"
  }(o || (o = {})),
  function(t) {
      t[t.GO_IDLE_STATE = 0] = "GO_IDLE_STATE",
      t[t.SEND_OP_COND = 1] = "SEND_OP_COND",
      t[t.SEND_IF_COND = 8] = "SEND_IF_COND",
      t[t.SEND_CSD = 9] = "SEND_CSD",
      t[t.SEND_CID = 10] = "SEND_CID",
      t[t.STOP_TRANSMISSION = 12] = "STOP_TRANSMISSION",
      t[t.SEND_STATUS = 13] = "SEND_STATUS",
      t[t.SET_BLOCKLEN = 16] = "SET_BLOCKLEN",
      t[t.READ_SINGLE_BLOCK = 17] = "READ_SINGLE_BLOCK",
      t[t.READ_MULTIPLE_BLOCK = 18] = "READ_MULTIPLE_BLOCK",
      t[t.SET_BLOCK_COUNT = 23] = "SET_BLOCK_COUNT",
      t[t.WRITE_BLOCK = 24] = "WRITE_BLOCK",
      t[t.WRITE_MULTIPLE_BLOCK = 25] = "WRITE_MULTIPLE_BLOCK",
      t[t.APP_CMD = 55] = "APP_CMD",
      t[t.READ_OCR = 58] = "READ_OCR",
      t[t.CRC_ON_OFF = 59] = "CRC_ON_OFF",
      t[t.INVALID = 255] = "INVALID"
  }(c || (c = {})),
  function(t) {
      t[t.SET_WR_BLOCK_ERASE_COUNT = 23] = "SET_WR_BLOCK_ERASE_COUNT",
      t[t.APP_SEND_OP_COND = 41] = "APP_SEND_OP_COND",
      t[t.APP_CLR_CARD_DETECT = 42] = "APP_CLR_CARD_DETECT"
  }(l || (l = {})),
  function(t) {
      t[t.Idle = 1] = "Idle",
      t[t.CRCError = 8] = "CRCError"
  }(h || (h = {})),
  function(t) {
      t[t.OutOfRange = 128] = "OutOfRange"
  }(d || (d = {}));
  const u = 254;
  class p {
      constructor(t, e) {
          this.spi = t,
          this.storage = e,
          (0,
          s.Z)(this, "state", o.Ready),
          (0,
          s.Z)(this, "currentCommand", c.INVALID),
          (0,
          s.Z)(this, "commandBuffer", new Uint8Array(5)),
          (0,
          s.Z)(this, "commandBufferIndex", 0),
          (0,
          s.Z)(this, "responseBuffer", new Uint8Array(1024)),
          (0,
          s.Z)(this, "responseBufferIndex", 0),
          (0,
          s.Z)(this, "responseBufferCount", 0),
          (0,
          s.Z)(this, "appCommand", !1),
          (0,
          s.Z)(this, "idle", !0),
          (0,
          s.Z)(this, "writeAddress", 0),
          (0,
          s.Z)(this, "writeBuffer", new Uint8Array(514)),
          (0,
          s.Z)(this, "writeBufferIndex", 0),
          (0,
          s.Z)(this, "crcEnabled", !1),
          (0,
          s.Z)(this, "r2Value", 0),
          (0,
          s.Z)(this, "processByte", (t=>{
              switch (this.state) {
              case o.Ready:
                  64 === (192 & t) && (this.currentCommand = 63 & t,
                  this.commandBufferIndex = 0,
                  this.state = o.Command);
                  break;
              case o.Command:
                  this.commandBuffer[this.commandBufferIndex++] = t,
                  this.commandBufferIndex === this.commandBuffer.length && (this.state = o.Ready,
                  this.processCommand());
                  break;
              case o.Write:
                  t === u ? (this.state = o.WriteData,
                  this.writeBufferIndex = 0) : 255 !== t && (this.state = o.Ready);
                  break;
              case o.WriteData:
                  if (this.writeBuffer[this.writeBufferIndex++] = t,
                  this.writeBufferIndex === this.writeBuffer.length) {
                      const t = this.writeBuffer.subarray(0, r)
                        , e = this.writeBuffer[512] << 8 | this.writeBuffer[513];
                      this.state = o.Ready,
                      this.r2Value = 0,
                      this.crcEnabled && e !== a_BYTELIST(t) ? this.respond([11]) : this.writeAddress >= this.storage.blockCount ? (this.r2Value = d.OutOfRange,
                      this.respond([13])) : (this.storage.writeBlock(this.writeAddress, t),
                      this.respond([5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255]))
                  }
              }
              this.responseBufferIndex < this.responseBufferCount ? (this.spi.sendByte(this.responseBuffer[this.responseBufferIndex]),
              this.responseBufferIndex++) : this.spi.sendByte(255)
          }
          )),
          t.onTransmit = this.processByte
      }
      get R1Flags() {
          return this.idle ? h.Idle : 0
      }
      get uintParam() {
          return (this.commandBuffer[0] << 24 | this.commandBuffer[1] << 16 | this.commandBuffer[2] << 8 | this.commandBuffer[3]) >>> 0
      }
      crcCheck() {
          const {commandBuffer: t} = this
            , e = function(t) {
              let e = 0;
              for (let i = 0; i < t.length; i++) {
                  let s = t[i];
                  for (let t = 0; t < 8; t++)
                      e <<= 1,
                      128 & s ^ 128 & e && (e ^= 9),
                      s <<= 1
              }
              return 127 & e
          }([64 | this.currentCommand, t[0], t[1], t[2], t[3]]);
          return t[4] === (e << 1 | 1)
      }
      respond(t) {
          this.responseBuffer.set(t),
          this.responseBufferIndex = 0,
          this.responseBufferCount = t.length
      }
      processCommand() {
          if (!this.crcEnabled || this.crcCheck()) {
              if (this.appCommand)
                  return this.appCommand = !1,
                  void this.processAppCommand();
              switch (this.currentCommand) {
              case c.GO_IDLE_STATE:
                  if (this.idle = !0,
                  !this.crcCheck())
                      return void this.respond([255, this.R1Flags | h.CRCError]);
                  this.respond([255, this.R1Flags]);
                  break;
              case c.SEND_IF_COND:
                  if (!this.crcCheck())
                      return void this.respond([255, this.R1Flags | h.CRCError, 0, 0, 0, 0]);
                  const t = this.commandBuffer[3];
                  this.respond([255, this.R1Flags, 0, 0, 1, t]);
                  break;
              case c.READ_OCR:
                  this.respond([255, this.R1Flags, 192, 255, 128, 0]);
                  break;
              case c.SEND_CSD:
                  this.respond([255, this.R1Flags, u, ...this.csd]);
                  break;
              case c.SEND_CID:
                  this.respond([255, this.R1Flags, u, ...this.cid]);
                  break;
              case c.SEND_STATUS:
                  this.respond([255, this.R1Flags, this.r2Value]);
                  break;
              case c.APP_CMD:
                  this.appCommand = !0,
                  this.respond([255, this.R1Flags]);
                  break;
              case c.CRC_ON_OFF:
                  this.crcEnabled = !!(1 & this.commandBuffer[3]),
                  this.respond([255, this.R1Flags]);
                  break;
              case c.STOP_TRANSMISSION:
                  this.respond([255, this.R1Flags]);
                  break;
              case c.READ_SINGLE_BLOCK:
              case c.READ_MULTIPLE_BLOCK:
                  {
                      const t = this.uintParam;
                      if (t >= this.storage.blockCount)
                          return void this.respond([255, this.R1Flags, 128]);
                      this.respond([255, this.R1Flags, 255, 255, 255, 255, u]);
                      const e = this.storage.readBlock(t)
                        , i = a_BYTELIST(e);
                      this.responseBuffer.set(e, this.responseBufferCount),
                      this.responseBufferCount += 512,
                      this.responseBuffer[this.responseBufferCount++] = i >> 8,
                      this.responseBuffer[this.responseBufferCount++] = 255 & i;
                      break
                  }
              case c.WRITE_BLOCK:
                  this.writeAddress = this.uintParam,
                  this.respond([255, this.R1Flags]),
                  this.state = o.Write;
                  break;
              default:
                  console.warn("Unimplemented SD Command: 0x".concat(this.currentCommand.toString(16)))
              }
          } else
              this.respond([255, this.R1Flags | h.CRCError])
      }
      processAppCommand() {
          switch (this.currentCommand) {
          case l.APP_SEND_OP_COND:
              this.idle = !1,
              this.respond([255, this.R1Flags]);
              break;
          case l.APP_CLR_CARD_DETECT:
              this.respond([255, this.R1Flags]);
              break;
          default:
              console.warn("Unimplemented SD APP Command: 0x".concat(this.currentCommand.toString(16)))
          }
      }
      get csd() {
          const t = Math.ceil(this.storage.blockCount / 1024) - 1
            , e = new Uint8Array(17);
          return e[0] = 64,
          e[1] = 14,
          e[2] = 0,
          e[3] = 90,
          e[4] = 91,
          e[5] = 9,
          e[6] = 0,
          e[7] = t >> 16 & 255,
          e[8] = t >> 8 & 255,
          e[9] = 255 & t,
          e[10] = 64,
          e[11] = 128,
          e[12] = 10,
          e[13] = 64,
          e[14] = 0,
          e[15] = 0,
          e[16] = 1,
          e
      }
      get cid() {
          const t = new Uint8Array(17);
          return t[0] = 66,
          t[1] = 67,
          t[2] = 77,
          t[3] = 87,
          t[4] = 79,
          t[5] = 75,
          t[6] = 87,
          t[7] = 73,
          t[8] = 16,
          t[9] = 254,
          t[10] = 202,
          t[11] = 254,
          t[12] = 202,
          t[13] = 1,
          t[14] = 185,
          t[15] = 0,
          t[16] = 1,
          t
      }
  }
  var f = i(23555);
  const g = 16384;
  class m {
      constructor(t, e) {
          (0,
          s.Z)(this, "data", new Uint8Array(8388608)),
          (0,
          s.Z)(this, "sdcardProtocol", void 0),
          (0,
          s.Z)(this, "blockCount", g);
          const i = new f.g({
              mosi: e.get("DI"),
              miso: e.get("DO"),
              clk: e.get("SCK"),
              ss: e.get("CS")
          },0,!0);
          this.sdcardProtocol = new p(i,this)
      }
      async init({files: t}) {
          var e;
          null !== (e = m.files) && void 0 !== e && e.length ? await this.initFS(m.files) : await this.initFS(t)
      }
      async initFS(t) {
          const {makeFatFS: e} = await Promise.all([i.e(4102), i.e(1720)]).then(i.bind(i, 31720));
          await e({
              flash: this.data,
              numBlocks: g,
              blockSize: r,
              noFat12: !0
          }, t)
      }
      update() {
          return null
      }
      reset() {}
      readBlock(t) {
          return this.data.subarray(t * r, (t + 1) * r)
      }
      writeBlock(t, e) {
          this.data.set(e, t * r)
      }
  }
  (0,
  s.Z)(m, "pinNames", ["CS", "SCK", "DI", "DO", "CD"]),
  (0,
  s.Z)(m, "files", void 0)
},