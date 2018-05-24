var utils = {};


utils.getUint16LEfromhex = function(str){
  octet0 = parseInt(str.substring(0, 1*2), 16);
  octet1 = parseInt(str.substring(1*2, 2*2), 16);
  val = (octet1 << 8) + octet0;
  return val;
}


utils.normaliseHex = function(raw) {
    value = raw.replace(/\s/g, '');
    value = value.toUpperCase();
    return value;
}

utils.byteArrayToWordArray = function(ba) {
    var wa = [],
        i;
    for (i = 0; i < ba.length; i++) {
        wa[(i / 4) | 0] |= ba[i] << (24 - 8 * i);
    }
    return CryptoJS.lib.WordArray.create(wa, ba.length);
}

utils.hexToBytes = function(str) {
    var result = [];
    while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }
    return result;
}

utils.bytesToHex = function(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
}

utils.toAsciiCodes = function(text) {
    var bytes = [];
    for (var i = 0; i < text.length; i++) {
        bytes.push(text.charCodeAt(i));
    }
    return bytes;
}

utils.toHex = function(number, octets) {
    hex = ("0" + (Number(number).toString(16))).toUpperCase();
    if (hex.length % 2 == 1) {
        hex = "0" + hex;
    }
    octet_count = hex.length / 2;
    if (octet_count < octets) {
        added_zeroes = octets - octet_count;
        for (var i = 0; i < added_zeroes; i++) {
            hex = "00" + hex;
        }
    } else if (octet_count > octets) {
        hex = hex.substring((octet_count - octets) * 2, hex.length);
    }
    return hex;
}

utils.hexToU8A = function(hex) {
    if (hex.length % 2 != 0) {
        console.log("ERROR: hex string must be even number in length and contain nothing but hex chars");
        return;
    }
    bytes = [];
    for (var i = 0; i < hex.length; i = i + 2) {
        bytes.push(parseInt(hex.substring(i, i + 2), 16));
    }
    result = new Uint8Array(bytes);
    return result;
}

utils.u8AToHexString = function(u8a) {
    hex = '';
    for (var i = 0; i < u8a.length; i++) {
        hex_pair = ('0' + u8a[i].toString(16));
        if (hex_pair.length == 3) {
            hex_pair = hex_pair.substring(1, 3);
        }
        hex = hex + hex_pair;
    }
    return hex;
}

// Convert an integer to a hex string, padded with a leading zero if required;
utils.intToHex = function(number) {
    hex = "00" + number.toString(16);
    return hex.substring(hex.length - 2);
}

utils.xorU8Array = function(bytes1, bytes2) {
    // Uint8Arrays in and out
    if (bytes1.length != bytes2.length) {
        memlog.warn("ERROR in xorU8Array: operands must be the same length");
        return new Uint8Array([]);
    }
    xor_bytes = [];
    for (var i = 0; i < bytes1.length; i++) {
        xor_bytes.push(bytes1[i] ^ bytes2[i]);
    }
    return new Uint8Array(xor_bytes);
}

utils.leastSignificantBit = function(number) {
    return number & 1;
}

utils.SWAPhex = function (hex){
  if (hex.length % 2 != 0) {
      console.log("ERROR: hex string must be even number in length and contain nothing but hex chars");
      return;
  }
  swaped_hex='';
  for (var i = 0; i < hex.length; i = i + 2) {
    offset = hex.length - i - 2;
    swaped_hex += hex.substring(offset, offset + 2);
  }

  return swaped_hex;
}
