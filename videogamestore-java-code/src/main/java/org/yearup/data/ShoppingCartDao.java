package org.yearup.data;

import org.yearup.models.Product;
import org.yearup.models.ShoppingCart;
import org.yearup.models.ShoppingCartItem;

public interface ShoppingCartDao
{
    ShoppingCart getByUserId(int userId);
    ShoppingCart addProduct(int userId, int productId);
    ShoppingCart updateProduct(int userId, int productId, ShoppingCartItem shoppingCartItem);
    ShoppingCart deleteShoppingCart(int userId);
}
