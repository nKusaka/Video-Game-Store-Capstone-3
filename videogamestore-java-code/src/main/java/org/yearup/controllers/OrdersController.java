package org.yearup.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.yearup.data.OrderDao;
import org.yearup.data.UserDao;
import org.yearup.models.Order;
import org.yearup.models.Product;
import org.yearup.data.ProductDao;
import org.yearup.models.ShoppingCart;
import org.yearup.models.User;

import java.security.Principal;

@RestController
@RequestMapping("checkout")
@CrossOrigin
@PreAuthorize("hasRole('ROLE_USER')")
public class OrdersController {
    private OrderDao orderDao;
    private UserDao userDao;

    @Autowired
    public OrdersController(OrderDao orderDao, UserDao userDao) {
        this.orderDao = orderDao;
        this.userDao = userDao;
    }

    @PostMapping("")
    public Order createOrder(Principal principal) {
        String userName = principal.getName();

        User user = userDao.getByUserName(userName);
        int userId = user.getId();

        try {
            return orderDao.createOrder(userId);
        } catch(Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Oops... our bad.");
        }
    }
}
