package com.karunfruits.controller;

import com.karunfruits.entity.Address;
import com.karunfruits.entity.User;
import com.karunfruits.exception.BadRequestException;
import com.karunfruits.exception.ResourceNotFoundException;
import com.karunfruits.repository.AddressRepository;
import com.karunfruits.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Address>> getAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(addressRepository.findByUserId(getUser(userDetails).getId()));
    }

    @PostMapping
    public ResponseEntity<Address> addAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody AddressRequest req) {
        User user = getUser(userDetails);
        if (addressRepository.countByUserId(user.getId()) >= 5) {
            throw new BadRequestException("Maximum 5 addresses allowed");
        }

        boolean makeDefault = req.isDefault() || addressRepository.countByUserId(user.getId()) == 0;
        if (makeDefault) clearDefaults(user.getId());

        Address address = Address.builder()
                .user(user)
                .name(req.name())
                .addressLine1(req.addressLine1())
                .addressLine2(req.addressLine2())
                .city(req.city())
                .state(req.state())
                .pincode(req.pincode())
                .phone(req.phone())
                .type(req.type() != null ? Address.AddressType.valueOf(req.type()) : Address.AddressType.HOME)
                .isDefault(makeDefault)
                .build();

        return ResponseEntity.ok(addressRepository.save(address));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Address> updateAddress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody AddressRequest req) {
        User user = getUser(userDetails);
        Address address = findOwnedAddress(id, user.getId());

        if (req.isDefault()) {
            clearDefaults(user.getId());
            address.setDefault(true);
        }

        address.setName(req.name());
        address.setAddressLine1(req.addressLine1());
        address.setAddressLine2(req.addressLine2());
        address.setCity(req.city());
        address.setState(req.state());
        address.setPincode(req.pincode());
        address.setPhone(req.phone());
        if (req.type() != null) address.setType(Address.AddressType.valueOf(req.type()));

        return ResponseEntity.ok(addressRepository.save(address));
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<Address> setDefault(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        Address address = findOwnedAddress(id, user.getId());
        clearDefaults(user.getId());
        address.setDefault(true);
        return ResponseEntity.ok(addressRepository.save(address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Address address = findOwnedAddress(id, getUser(userDetails).getId());
        addressRepository.delete(address);
        return ResponseEntity.noContent().build();
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Address findOwnedAddress(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Not authorized");
        }
        return address;
    }

    private void clearDefaults(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        addresses.forEach(a -> a.setDefault(false));
        addressRepository.saveAll(addresses);
    }

    public record AddressRequest(
            String name,
            String addressLine1,
            String addressLine2,
            String city,
            String state,
            String pincode,
            String phone,
            String type,
            boolean isDefault
    ) {}
}
