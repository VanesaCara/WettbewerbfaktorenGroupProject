package wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.Einzelhandel.Markt;
import wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.Einzelhandel.Nutzer;
import wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.Service.UserService;
import wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.DTO.LoginDTO;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Registration endpoint
    @PostMapping("/register")
    public ResponseEntity<Nutzer> registerUser(@RequestBody Nutzer user) {
        return ResponseEntity.ok(userService.registerUser(user));
    }

    // Authentication endpoint
    @PostMapping("/login")
    public ResponseEntity<Nutzer> loginUser(@RequestBody LoginDTO loginDTO) {
        Nutzer authenticatedUser = userService.authenticateUser(loginDTO.getEmail(), loginDTO.getPassword());
        // We return the user object, excluding sensitive data such as the password
        authenticatedUser.setPassword(null); // Ensure password is not returned
        return ResponseEntity.ok(authenticatedUser); // Return user details
    }


    // Add a Markt to the User's list
    @PostMapping("/{userId}/addMarkt")
    public ResponseEntity<Nutzer> addMarktToUser(@PathVariable Long userId, @RequestBody String marktAddress) {
        return ResponseEntity.ok(userService.addMarktToUser(userId, marktAddress));
    }

    // Get the list of Markts for a User
    @GetMapping("/{userId}/markts")
    public ResponseEntity<List<Markt>> getUserMarkts(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserMarkts(userId));
    }
}
