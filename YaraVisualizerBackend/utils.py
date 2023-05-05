def string_to_hex(string: str):
    return ''.join(hex(ord(c))[2:] for c in string)


def hex_to_string(_hex: str):
    return ''.join(chr(int(_hex[i:i + 2], 16)) for i in range(0, len(_hex), 2))


def string_to_binary(string: str):
    return ''.join(format(ord(c), 'b') for c in string)


def string_to_ascii(string: str):
    return ''.join(str(ord(c)) for c in string)


def string_to_base64(string: str):
    return string.encode('base64', 'strict')


def string_to_utf8(string: str):
    return string.encode('utf-8')


def string_to_utf16(string: str):
    return string.encode('utf-16')


def string_to_utf32(string: str):
    return string.encode('utf-32')


def string_to_raw(string: str):
    return string.encode('raw_unicode_escape')


def yara_string_match_instance_plaintext(matched_data, xor_key):
    if xor_key == 0:
        return matched_data
    return b''.join((character ^ xor_key).to_bytes(length=1, byteorder='big') for character in matched_data)
