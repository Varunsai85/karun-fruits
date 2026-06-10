package com.karunfruits;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class KarunfruitsApplication {

    public static void main(String[] args) {
        SpringApplication.run(KarunfruitsApplication.class, args);
    }

}
