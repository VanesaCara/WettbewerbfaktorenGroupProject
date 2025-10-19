package wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.Repositiory;

import org.apache.catalina.User;
import org.springframework.data.jpa.repository.JpaRepository;
import wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.Einzelhandel.Markt;

public interface MarktRepository extends JpaRepository<Markt,Long> {
}
