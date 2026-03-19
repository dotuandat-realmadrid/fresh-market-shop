package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.auth.AuthenticationRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.auth.IntrospectRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.auth.LogoutRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.auth.RefreshRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.auth.AuthenticationResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.auth.IntrospectResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.auth.RefreshResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface AuthenticationService {

    AuthenticationResponse authenticate(AuthenticationRequest request);

    IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException;

    void logout(LogoutRequest request) throws ParseException, JOSEException;

    RefreshResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException;
}
