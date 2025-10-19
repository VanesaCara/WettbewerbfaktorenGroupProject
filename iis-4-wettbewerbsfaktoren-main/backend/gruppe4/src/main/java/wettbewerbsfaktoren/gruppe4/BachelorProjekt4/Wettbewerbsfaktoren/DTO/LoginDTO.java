package wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren.DTO;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class LoginDTO {
    private String email; // Statt username
    private String password;
}
