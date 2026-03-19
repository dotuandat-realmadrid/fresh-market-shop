package com.dotuandat.thesis.freshmarket.dtos.request.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiRequest {
    public String apiUrl;
    public String apiKey;
}
