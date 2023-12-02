package com.dchampion.frameworkdemo.http;

import java.util.List;
import java.util.Arrays;

import com.dchampion.framework.http.AsyncRequestHandler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * A contrived {@link RestController} class that demonstrates the usage of an {@link AsyncRequestHandler}
 * to manage the lifecycle of a long-running HTTP request from a client.
 */
@RestController
@RequestMapping("/long-call")
public class LongRunningTaskController {

    @Autowired
    private AsyncRequestHandler<List<String>> handler;

    /**
     * Submit a request to execute a long-running operation. This method should return immediately
     * with an HTTP status code of {@code 202 (ACCEPTED)}.
     * 
     * @param param an optional timeout value in the form {@code {timeout: n}}, where {@code n}
     * is the time, in seconds, after which this request will stop waiting for the long-running
     * operation to complete.
     * @return a {@link ResponseEntity} containing no body, but response headers indicating
     * the status of the long-running operation ({@code Task-Status=submitted})
     * and a unique id ({@code Task-Id=<some_unique_id>}) to be used in the URL path of subsequent calls to
     * {@link #poll(String) poll}, which queries the status of the long-running operation.
     * 
     * @see poll
     */
    @PostMapping("/submit")
    public ResponseEntity<List<String>> submit(@RequestBody(required=false) TimeoutParameter param) {
        int timeout = param != null ? param.getTimeout() : 10;
        return handler.submit(() -> longRunningTask(), timeout);
    }

    /**
     * Poll the status of a long-running operation started by a previous call to
     * {@link #submit(TimeoutParameter) submit}.
     * 
     * @param id a unique ID returned by a previous call to {@link #submit(TimeoutParameter) submit}.
     * Note this parameter is supplied as a {@link PathVariable}, not a URL parameter.
     * @return a {@link ResponseEntity} containing headers indicating the status ({@code Task-Status})
     * of a long-running operation started by a previous call to {@link #submit(TimeoutParameter) submit}.
     * If {@code Task-Status=complete}, the {@link ResponseEntity} will also contain a body containing
     * the results of the long-running operation.
     * 
     * @see submit
     */
    @GetMapping("/poll/{id}")
    public ResponseEntity<List<String>> poll(@PathVariable String id) {
        return handler.poll(id);
    }

    // A long-running task.
    private List<String> longRunningTask() throws InterruptedException {
        Thread.sleep(9000);
        return Arrays.asList("Hello", "Client!");
    }
}

// A mappable container for timeout.
class TimeoutParameter {
    private int timeout;

    int getTimeout() {
        return timeout;
    }

    void setTimeout(int timeout) {
        this.timeout = timeout;
    }

    @Override
    public String toString() {
        return "Timeout: " + timeout;
    }
}