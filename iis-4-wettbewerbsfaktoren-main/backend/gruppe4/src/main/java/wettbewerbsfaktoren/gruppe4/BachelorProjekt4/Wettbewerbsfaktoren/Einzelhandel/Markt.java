package wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.Einzelhandel;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "markt")
public class Markt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String address;

    // Viele Nutzer können mit einem Markt verbunden sein
    @ManyToMany(mappedBy = "markte")
    private List<Nutzer> users = new ArrayList<>();

    // Getter und Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public List<Nutzer> getUsers() {
        return users;
    }

    public void setUsers(List<Nutzer> users) {
        this.users = users;
    }
}
