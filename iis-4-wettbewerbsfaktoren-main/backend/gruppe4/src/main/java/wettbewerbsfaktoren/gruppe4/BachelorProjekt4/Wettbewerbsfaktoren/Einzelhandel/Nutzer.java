package wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.Einzelhandel;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_db")
public class Nutzer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String lastname;

    @Column(nullable = false)
    private String firstname;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    // Viele Märkte können einem Nutzer zugeordnet werden
    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
            name = "user_market", // Der Name der Zwischentabelle
            joinColumns = @JoinColumn(name = "user_id"), // Fremdschlüssel für Nutzer
            inverseJoinColumns = @JoinColumn(name = "market_id") // Fremdschlüssel für Markt
    )
    private List<Markt> markte = new ArrayList<>();

    // Getter und Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public List<Markt> getMarkte() {
        return markte;
    }

    public void setMarkte(List<Markt> markts) {
        this.markte = markts;
    }
}
