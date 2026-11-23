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

/**
 * Robust, universal database configuration supporting Supabase (PostgreSQL),
 * MySQL, and cloud connection strings with automatic dialect resolution.
 */
@Configuration
public class DatabaseConfig implements HibernatePropertiesCustomizer {
    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

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

        // 1. Convert standard URI format (e.g. postgresql://user:pass@host:port/dbname)
        if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
            try {
                URI uri = URI.create(url);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    if (user.isBlank() || "root".equals(user)) {
                        user = parts[0];
                    }
                    if (pass.isBlank() || "12345".equals(pass)) {
                        pass = parts[1];
                    }
                }
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                url = "jdbc:postgresql://" + host + ":" + port + path;
                String query = uri.getQuery();
                if (query != null && !query.isBlank()) {
                    url += "?" + query;
                }
            } catch (Exception e) {
                log.warn("Failed to parse postgres URI [{}]: {}", url, e.getMessage());
                if (!url.startsWith("jdbc:")) {
                    url = "jdbc:" + url;
                }
            }
        }

        // 2. Ensure JDBC prefix
        if (!url.startsWith("jdbc:")) {
            if (url.contains("postgres")) {
                url = "jdbc:postgresql://" + url;
            } else {
                url = "jdbc:mysql://" + url;
            }
        }

        // 3. For Supabase PostgreSQL, enforce SSL
        if (url.contains("supabase.co") && !url.contains("sslmode=")) {
            url += (url.contains("?") ? "&" : "?") + "sslmode=require";
        }

        // 4. Determine driver class name
        String driver = rawDriverClassName != null ? rawDriverClassName.trim() : "";
        if (driver.isBlank()) {
            if (url.contains(":postgresql:")) {
                driver = "org.postgresql.Driver";
            } else {
                driver = "com.mysql.cj.jdbc.Driver";
            }
        }

        log.info("Initialized DataSource: driver=[{}], url=[{}], username=[{}]", driver, maskUrl(url), user);

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
        if (url.contains("postgres")) {
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
