package com.dchampion.frameworkdemo.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Entity
@Table(schema = "FRAMEWORK_DEMO", name = "SHARED_RESPONSE_CACHE")
public class Response {

    @Id
    @GeneratedValue
    private Long id;

    private String uuid;

    private String headers;

    private String body;

    @Transient
    private static final ObjectMapper mapper = new ObjectMapper();

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return this.id;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getUuid() {
        return this.uuid;
    }

    public void setHeaders(String headers) {
        this.headers = headers;
    }

    public String getHeaders() {
        return this.headers;
    }

    public void setBody(Object body) throws JsonProcessingException {
        this.body = mapper.writeValueAsString(body);
    }

    public Object getBody() throws JsonProcessingException {
        if (body != null) {
            return mapper.readValue(body, Object.class);
        }
        return body;
    }
}
