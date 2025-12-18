package org.yearup.data;

import org.yearup.models.Order;
import org.yearup.models.Profile;
import org.yearup.models.ShoppingCart;

public interface OrderDao {
    Order createOrder(int userId, Profile profile, ShoppingCart shoppingcart);
    Order getByOrderId(int orderId);
}
