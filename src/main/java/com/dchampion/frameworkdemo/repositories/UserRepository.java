package com.dchampion.frameworkdemo.repositories;

import com.dchampion.frameworkdemo.entities.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * A repository supporting CRUD operations on {@link User} entities.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}
