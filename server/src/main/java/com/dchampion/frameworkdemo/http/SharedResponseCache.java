package com.dchampion.frameworkdemo.http;

import java.util.UUID;

import com.dchampion.framework.http.ResponseCache;
import com.dchampion.frameworkdemo.services.ResponseService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

/**
 * A shared implementation of {@link ResponseCache}. This implementation will be
 * injected into instances of {@code AsyncRequestHandler} if the property 
 * {@code async.response_cache.scope=shared} is set in {@code application.properties}.
 * <p>
 * See class-level javadoc in {@code AsyncRequestHandler} for hints on how one might
 * implement this class.
 * 
 * @param <T> the type of the body of a {@link ResponseEntity}.
 */
@Component
@ConditionalOnProperty(name = "async.response_cache.scope", havingValue = "shared")
public class SharedResponseCache<T> implements ResponseCache<T> {

    @Autowired
    private ResponseService responseService;

    @Override
    public void put(UUID key, ResponseEntity<T> response) {
        responseService.saveOrUpdate(key, response);
    }

    @Override
    public ResponseEntity<T> get(UUID key) {
        return responseService.getIfPresent(key);
    }

    @Override
    public void remove(UUID key) {
        responseService.remove(key);
    }
}
