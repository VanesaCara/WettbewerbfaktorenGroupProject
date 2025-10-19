package wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.Repositiory;

import org.apache.catalina.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.Einzelhandel.Nutzer;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Nutzer,Long> {
    Optional<Nutzer> findByEmail(String email);
}
