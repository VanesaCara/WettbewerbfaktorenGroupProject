package wettbewerbsfaktoren.gruppe4.BachelorProjekt4.Wettbewerbsfaktoren;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Für alle Endpunkte
                .allowedOrigins("http://localhost:4200") // Der Port, von dem die Anfragen kommen
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Erlaubte HTTP-Methoden
                .allowedHeaders("*") // Erlaubte Header
                .allowCredentials(true); // Erlaube das Senden von Cookies
    }
}
