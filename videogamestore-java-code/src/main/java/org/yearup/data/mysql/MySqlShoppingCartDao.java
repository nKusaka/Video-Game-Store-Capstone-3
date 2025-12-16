package org.yearup.data.mysql;

import org.springframework.beans.factory.annotation.Autowired;
import org.yearup.data.ShoppingCartDao;
import org.yearup.models.ShoppingCart;
import org.springframework.stereotype.Component;
import org.yearup.models.Product;
import org.yearup.data.ProductDao;
import org.yearup.models.ShoppingCartItem;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.sql.Connection;
import java.util.Map;

@Component
public class MySqlShoppingCartDao extends MySqlDaoBase implements ShoppingCartDao {

    public MySqlShoppingCartDao(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public ShoppingCart getByUserId(int userId) {
        ShoppingCart shoppingCart = new ShoppingCart();
        int hashMapKey = 1;
        Map<Integer, ShoppingCartItem> items = new HashMap<>();

        String sql = """
                SELECT * FROM shopping_cart
                LEFT JOIN products
                ON shopping_cart.product_id = products.product_id
                WHERE user_id = ?;""";

        try (Connection connection = getConnection()) {
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            preparedStatement.setInt(1, userId);
            ResultSet resultSet = preparedStatement.executeQuery();

            while (resultSet.next()) {
                ShoppingCartItem shoppingCartItem = new ShoppingCartItem();
                Product product = new Product(
                        resultSet.getInt("product_id"),
                        resultSet.getString("name"),
                        resultSet.getBigDecimal("price"),
                        resultSet.getInt("category_id"),
                        resultSet.getString("description"),
                        resultSet.getString("subcategory"),
                        resultSet.getInt("stock"),
                        resultSet.getBoolean("featured"),
                        resultSet.getString("image_url")
                );
                shoppingCartItem.setQuantity(resultSet.getInt("quantity"));
                shoppingCartItem.setProduct(product);
                items.put(hashMapKey, shoppingCartItem);
                hashMapKey++;
                shoppingCart.setItems(items);
            }

        } catch (SQLException e) {
            System.out.println("Error trying to get your cart " +
                    e.getMessage());
        }
        return shoppingCart;
    }

    @Override
    public void addProduct(int productId) {

    }
}
