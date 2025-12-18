package org.yearup.data;

import org.yearup.models.OrderLineItem;
import org.yearup.models.ShoppingCartItem;

import java.util.List;

public interface OrderLineItemDao {
    void create(int productId, int orderId, ShoppingCartItem shoppingCartItem);
}
