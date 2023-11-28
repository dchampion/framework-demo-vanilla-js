package com.dchampion.frameworkdemo.services;

import java.util.List;

import com.dchampion.framework.security.PasswordUtils;
import com.dchampion.frameworkdemo.entities.User;
import com.dchampion.frameworkdemo.repositories.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;

/**
 * A {@link Service} to manage the registration, authentication and retrieval
 * of {@link User}s from the datastore.
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordUtils passwordUtils;

    /**
     * Returns a list of all registered users, or an empty list if none exists.
     *
     * @return a list of all registered users, or an empty list if none exists.
     */
    public List<User> getAll() {
        List<User> users = userRepository.findAll();
        users.forEach(user -> user.setPassword(""));
        return users;
    }

    /**
     * Returns the {@link User} corresponding to the supplied username/password pair
     * from the datastore, or {@code null} if the {@link User} corresponding to
     * the supplied username does not exist and/or if the supplied password is invalid.
     *
     * @param username The username of the requested {@link User}.
     * @param password The password of the requested {@link User}.
     *
     * @return The requested {@link User}, or {@code null} if the supplied
     * credentials are invalid.
     */
    public User get(String username, String password) {
        User user = null;
        List<User> users = userRepository.findAll(probe(username));
        if (users.size() == 1 && passwordUtils.getEncoder().matches(password, users.get(0).getPassword())) {
            user = users.get(0);
            user.setPassword("");
        }
        return user;
    }

    /**
     * Adds the supplied {@link User} if it does not already exist in the
     * datastore. Existence is defined as a user whose username matches that
     * of the supplied {@link User}.
     *
     * @param user the {@link User} to add to the datastore.
     *
     * @return the added {@link User}, or {@code null} if the user already exists
     * or could not otherwise be saved to the datastore.
     */
    public boolean add(User user) {
        boolean added = false;
        if (!exists(user.getUsername())) {
            String encoded = passwordUtils.getEncoder().encode(user.getPassword());
            user.setPassword(encoded);
            userRepository.save(user);
            added = true;
        }
        return added;
    }

    /**
     * Removes the {@link User} corresponding to the supplied username from the
     * datastore.
     *
     * @param username The username of the {@link User} to delete.
     *
     * @return {@code true} if the user was successfully deleted; otherwise
     * {@code false}.
     */
    public boolean delete(String username) {
        boolean deleted = false;
        List<User> users = userRepository.findAll(probe(username));
        if (users.size() == 1) {
            userRepository.delete(users.get(0));
            deleted = true;
        }
        return deleted;
    }

    /**
     * Returns {@code true} if the supplied username matches a {@link User} containing
     * the same username in the datastore; otherwise returns {@code false}.
     *
     * @param username the {@link User} to test for existence in the datastore.
     *
     * @return {@code true} if the user exists; {@code false} otherwise.
     */
    public boolean exists(String username) {
        return userRepository.exists(probe(username));
    }

    private Example<User> probe(String username) {
        User probe = new User();
        probe.setUsername(username);
        return Example.of(probe);
    }

    /**
     * Returns {@code true} if the supplied password has been previously leaked in a
     * known data breach; otherwise returns {@code false}.
     *
     * @param password The password to test for a breach.
     *
     * @return {@code true} if the password has been leaked; {@code false} otherwise.
     */
    public boolean passwordLeaked(String password) {
        return passwordUtils.isLeaked(password);
    }
}