
def yara_string_match_instance_plaintext(matched_data, xor_key):
    if xor_key == 0:
        return matched_data
    return b''.join((character ^ xor_key).to_bytes(length=1, byteorder='big') for character in matched_data)
