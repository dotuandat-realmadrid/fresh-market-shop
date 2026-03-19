package com.dotuandat.thesis.freshmarket.utils;

import com.dotuandat.thesis.freshmarket.entities.Address;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class AddressUtils {
    public static String generateUniqueAddressKey(Address address) {
        String uniqueAddressKey = address.getUser().getId()
                + address.getFullName()
                + address.getPhone()
                + address.getProvince()
                + address.getDistrict()
                + address.getWard()
                + address.getDetail();

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(uniqueAddressKey.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error generating hash for address", e);
        }
    }
}
