package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.entities.User;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;

import java.text.ParseException;

public interface TokenService {

    String generateToken(User user);

    public SignedJWT verifyToken(String token, boolean isRefresh) throws ParseException, JOSEException;
}
