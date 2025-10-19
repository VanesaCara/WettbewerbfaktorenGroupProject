package wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.Einzelhandel.Markt;
import wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.Einzelhandel.Nutzer;
import wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.Repositiory.MarktRepository;
import wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.Repositiory.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MarktRepository marktRepository;

    // Benutzer registrieren
    public Nutzer registerUser(Nutzer user) {
        return userRepository.save(user);
    }

    // Benutzer authentifizieren
    public Nutzer authenticateUser(String email, String password) {
        Optional<Nutzer> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            Nutzer user = userOptional.get();
            if (user.getPassword().equals(password)) {
                return user;
            }
        }
        throw new RuntimeException("Invalid email or password");
    }

    // Markt zum Nutzer hinzufügen
    public Nutzer addMarktToUser(Long userId, String marktAddress) {
        Nutzer user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Markt markt = new Markt();
        markt.setAddress(marktAddress);
        marktRepository.save(markt);

        user.getMarkte().add(markt);
        return userRepository.save(user);
    }

    // Märkte eines Nutzers abfragen
    public List<Markt> getUserMarkts(Long userId) {
        Nutzer user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return user.getMarkte();
    }
}
