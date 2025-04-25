package edu.tum.ase.authorization.service;

import edu.tum.ase.authorization.model.UserEntity;
import edu.tum.ase.authorization.model.UserEntityDetails;
import edu.tum.ase.authorization.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserEntityDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Username " + username + " does not exist."));

        if (Objects.equals(user.getPassword(), "")) {
            throw new UsernameNotFoundException("Username " + username + " does not exist.");
        }

        return new UserEntityDetails(user);
    }
}
