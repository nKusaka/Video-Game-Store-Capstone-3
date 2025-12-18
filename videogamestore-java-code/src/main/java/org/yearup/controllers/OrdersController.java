package org.yearup.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcherEntry;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.yearup.data.*;
import org.yearup.models.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("checkout")
@CrossOrigin
@PreAuthorize("hasRole('ROLE_USER')")
public class OrdersController {
    private OrderDao orderDao;
    private UserDao userDao;
    private OrderLineItemDao orderLineItemDao;
    private ShoppingCartDao shoppingCartDao;
    private ProfileDao profileDao;

    @Autowired
    public OrdersController(OrderDao orderDao, UserDao userDao, OrderLineItemDao orderLineItemDao, ShoppingCartDao shoppingCartDao, ProfileDao profileDao) {
        this.orderDao = orderDao;
        this.userDao = userDao;
        this.orderLineItemDao = orderLineItemDao;
        this.shoppingCartDao = shoppingCartDao;
        this.profileDao = profileDao;
    }

    @PostMapping("")
    public Order createOrder(Principal principal) {
        String userName = principal.getName();

        User user = userDao.getByUserName(userName);
        int userId = user.getId();

        ShoppingCart shoppingCart = shoppingCartDao.getByUserId(userId);
        Profile profile = profileDao.getByUserId(userId);
        if (shoppingCart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        Order order = orderDao.createOrder(userId, profile, shoppingCart);

        for (Map.Entry<Integer, ShoppingCartItem> shoppingCartItem: shoppingCart.getItems().entrySet()) {
            orderLineItemDao.create(shoppingCartItem.getKey(), order.getOrderId(), shoppingCartItem.getValue());
        }
        shoppingCartDao.deleteShoppingCart(userId);
        return order;
    }
}
