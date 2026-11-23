package com.smarthire.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Universal, auto-healing database configuration supporting Supabase (PostgreSQL),
 * MySQL, and cloud connection strings with automatic dialect resolution.
 */
@Configuration
public class DatabaseConfig implements HibernatePropertiesCustomizer {
    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);
    private static final Pattern SUPABASE_REF_PATTERN = Pattern.compile("([a-z0-9]{15,30})\\.supabase\\.co");

    @Value("${spring.datasource.url:jdbc:mysql://localhost:3306/hk_db}")
    private String rawUrl;

    @Value("${spring.datasource.username:root}")
    private String rawUsername;

    @Value("${spring.datasource.password:12345}")
    private String rawPassword;

    @Value("${spring.datasource.driver-class-name:}")
    private String rawDriverClassName;

    @Value("${smarthire.database.dialect:}")
    private String explicitDialect;

    @Bean
    @Primary
    public DataSource dataSource() {
        String url = rawUrl != null ? rawUrl.trim() : "jdbc:mysql://localhost:3306/hk_db";
        String user = rawUsername != null ? rawUsername.trim() : "root";
        String pass = rawPassword != null ? rawPassword.trim() : "12345";

        boolean isSupabase = url.toLowerCase().contains("supabase.co") || url.toLowerCase().contains("supabase") || (user != null && user.toLowerCase().contains("supabase"));
        boolean isPostgres = isSupabase || url.toLowerCase().contains("postgres");

        // Auto-fix verified Tokyo Pooler for project mizoiaobwoqsinhqyqxh
        if (url.contains("mizoiaobwoqsinhqyqxh") || (user != null && user.contains("mizoiaobwoqsinhqyqxh"))) {
            log.info("Auto-routing to verified Supabase Tokyo Pooler for project mizoiaobwoqsinhqyqxh on port 6543...");
            url = "jdbc:postgresql://aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0";
            user = "postgres.mizoiaobwoqsinhqyqxh";
            isPostgres = true;
            isSupabase = true;
        } else if (isSupabase) {
            log.info("Detected Supabase environment. Normalizing connection parameters...");

            // If user supplied https://<ref>.supabase.co or <ref>.supabase.co
            Matcher matcher = SUPABASE_REF_PATTERN.matcher(url);
            if (matcher.find()) {
                String projectRef = matcher.group(1);
                // If it doesn't already contain db. or a port, construct the correct DB endpoint
                if (!url.contains("db." + projectRef) && !url.contains(":5432") && !url.contains(":6543")) {
                    log.info("Converting Supabase project URL to direct PostgreSQL endpoint for ref: {}", projectRef);
                    url = "jdbc:postgresql://db." + projectRef + ".supabase.co:5432/postgres?sslmode=require";
                }
            }

            // If username is still default root or empty, set to Supabase default postgres
            if (user.isBlank() || "root".equalsIgnoreCase(user)) {
                user = "postgres";
            }
        }

        // 2. Parse standard URI format (e.g. postgresql://user:pass@host:port/dbname)
        if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
            try {
                URI uri = URI.create(url);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    if (user.isBlank() || "root".equals(user) || "AshwaAstra".equalsIgnoreCase(user)) {
                        user = parts[0];
                    }
                    if (pass.isBlank() || "12345".equals(pass)) {
                        pass = parts[1];
                    }
                }
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                if (path == null || path.isBlank() || "/".equals(path)) {
                    path = "/postgres";
                }
                url = "jdbc:postgresql://" + host + ":" + port + path;
                String query = uri.getQuery();
                if (query != null && !query.isBlank()) {
                    url += "?" + query;
                }
            } catch (Exception e) {
                log.warn("Failed to parse postgres URI [{}]: {}", url, e.getMessage());
            }
        }

        // Strip any accidental http:// or https:// from inside the URL
        url = url.replace("jdbc:mysql://https://", "jdbc:postgresql://")
                 .replace("jdbc:mysql://http://", "jdbc:postgresql://")
                 .replace("jdbc:postgresql://https://", "jdbc:postgresql://")
                 .replace("jdbc:postgresql://http://", "jdbc:postgresql://")
                 .replace("https://", "")
                 .replace("http://", "");

        // 3. Ensure proper JDBC prefix based on DB type
        if (!url.startsWith("jdbc:")) {
            if (isPostgres) {
                url = "jdbc:postgresql://" + url;
            } else {
                url = "jdbc:mysql://" + url;
            }
        } else if (isPostgres && url.startsWith("jdbc:mysql:")) {
            // Fix driver/protocol mismatch
            url = "jdbc:postgresql:" + url.substring("jdbc:mysql:".length());
        }

        // 4. For Supabase or PostgreSQL cloud instances, enforce SSL and pooler compatibility
        if (isPostgres) {
            if (!url.contains("sslmode=")) {
                url += (url.contains("?") ? "&" : "?") + "sslmode=require";
            }
            if (url.contains("pooler.supabase.com") && !url.contains("prepareThreshold=")) {
                url += "&prepareThreshold=0";
            }
        }

        // 5. Select proper JDBC Driver
        String driver = rawDriverClassName != null ? rawDriverClassName.trim() : "";
        if (isPostgres) {
            driver = "org.postgresql.Driver";
        } else if (driver.isBlank()) {
            driver = "com.mysql.cj.jdbc.Driver";
        }

        log.info("Final Initialized DataSource -> Driver: [{}], URL: [{}], User: [{}]", driver, maskUrl(url), user);

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(user);
        config.setPassword(pass);
        config.setDriverClassName(driver);
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);
        config.setPoolName("SmartHire-HikariCP");

        return new HikariDataSource(config);
    }

    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        if (explicitDialect != null && !explicitDialect.isBlank()) {
            log.info("Using explicitly configured Hibernate dialect: {}", explicitDialect);
            hibernateProperties.put("hibernate.dialect", explicitDialect.trim());
            return;
        }

        String url = rawUrl != null ? rawUrl.toLowerCase().trim() : "";
        boolean isPostgres = url.contains("supabase") || url.contains("postgres");

        if (isPostgres) {
            log.info("Auto-setting Hibernate dialect to: org.hibernate.dialect.PostgreSQLDialect");
            hibernateProperties.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        } else {
            log.info("Auto-setting Hibernate dialect to: org.hibernate.dialect.MySQLDialect");
            hibernateProperties.put("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
        }
    }

    private String maskUrl(String u) {
        if (u == null) return "";
        return u.replaceAll(":[^/@]+@", ":****@");
    }
}
