package com.dchampion.frameworkdemo.http;

import java.util.List;

import com.dchampion.frameworkdemo.entities.User;
import com.dchampion.frameworkdemo.services.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * A {@link RestController} that manages user registration and authentication.
 */
@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    private static final String registrationSuccessful =
        "Registration successful";

    private static final String userExists =
        "User already exists";

    private static final String userDoesNotExist =
        "User not found";

    private static final String passwordLeaked =
        "This password has previously appeared in a data breach. " +
        "Please choose a more secure alternative.";

    private static final String authFailed =
        "Authentication failed; contact site administrator";

    private static final String registrationFailed =
        "Registration failed; contact site administrator";

    /**
     * Returns a list of all registered {@link User}s, or an empty list if none exists.
     *
     * @return a list of all registered {@link User}s, or an empty list if none exists.
     */
    @GetMapping
    public ResponseEntity<List<User>> users() {
        return ResponseEntity.ok(userService.getAll());
    }

    /**
     * Registers the supplied {@link User}, allowing subsequent authentication given
     * valid credentials.
     * <p>
     * Registration is allowed if the username embedded in the request has not already
     * been registered, and if the password embedded in the request has not been leaked
     * in a known data breach; otherwise, registration fails.
     *
     * @param user the {@link User} to register.
     *
     * @return {@link HttpStatus#OK} if the registration is successful;
     * otherwise {@link HttpStatus#BAD_REQUEST} if the user already exists,
     * {@link HttpStatus#FORBIDDEN} if the supplied password has been breached,
     * or {@link HttpStatus#INTERNAL_SERVER_ERROR} if registration fails for
     * any other reason.
     */
    @PostMapping(value="/register", produces="text/plain")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (userService.exists(user.getUsername())) {
            return ResponseEntity.badRequest().body(userExists);
        }
        if (userService.passwordLeaked(user.getPassword())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(passwordLeaked);
        }
        if (!userService.add(user)) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(registrationFailed);
        }
        return ResponseEntity.ok().body(registrationSuccessful);
    }

    /**
     * Authenticates the supplied {@link User}, given valid credentials (i.e.
     * a username corresponding to an existing user in the datastore and a valid
     * password for that user).
     *
     * @param candidate the {@link User} to authenticate.
     *
     * @return The authenticated {@link User} if the request is successful; otherwise
     * {@link HttpStatus#BAD_REQUEST} if the user does not exist, or
     * {@link HttpStatus#UNAUTHORIZED} if the password is invalid.
     */
    @PostMapping(value="/authenticate", produces="text/plain")
    public ResponseEntity<Object> authenticate(@RequestBody User candidate) {
        if (!userService.exists(candidate.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(userDoesNotExist);
        }
        User user = userService.get(candidate.getUsername(), candidate.getPassword());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(authFailed);
        }
        boolean leaked = userService.passwordLeaked(candidate.getPassword());
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .header("Password-Leaked", Boolean.toString(leaked)).body(user);
    }

    /**
     * Tells the caller if the supplied password has been previously leaked in a
     * known data breach.
     *
     * @param password The password to test for a leak.
     *
     * @return {@code true} if the password has been leaked; {@code false} otherwise.
     */
    @PostMapping(value="/is-pw-leaked", produces="text/plain")
    public ResponseEntity<String> isPasswordLeaked(@RequestBody String password) {
        if (userService.passwordLeaked(password)) {
            return ResponseEntity.ok().body(passwordLeaked);
        }
        return ResponseEntity.ok().body("");
    }

    /**
     * Removes the {@link User} corresponding to the supplied username from the
     * datastore.
     *
     * @param username The username of the {@link User} to remove from the datastore.
     */
    @DeleteMapping("/{username}")
    public ResponseEntity<Void> delete(@PathVariable String username) {
        if (userService.delete(username)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }
}
