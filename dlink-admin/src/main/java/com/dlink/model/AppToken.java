package com.dlink.model;

import lombok.Data;

import java.io.Serializable;

/**
 * AppToken
 *
 * @author cl1226
 * @since 2023/5/19 13:35
 **/
@Data
public class AppToken implements Serializable {

    Integer appId;
    String token;
    Long expireAt;

}
