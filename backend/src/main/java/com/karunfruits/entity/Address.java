package com.karunfruits.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String name;

    @Column(nullable = false)
    private String addressLine1;

    private String addressLine2;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String pincode;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AddressType type = AddressType.HOME;

    @JsonProperty("isDefault")
    @Builder.Default
    private boolean isDefault = false;

    public enum AddressType {
        HOME, OFFICE, OTHER
    }
}
