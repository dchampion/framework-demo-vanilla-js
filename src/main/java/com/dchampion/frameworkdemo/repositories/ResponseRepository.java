package com.dchampion.frameworkdemo.repositories;

import com.dchampion.frameworkdemo.entities.Response;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * A repository supporting CRUD operations on {@link Response} entities.
 */
@Repository
public interface ResponseRepository extends JpaRepository<Response, Long> {
}
