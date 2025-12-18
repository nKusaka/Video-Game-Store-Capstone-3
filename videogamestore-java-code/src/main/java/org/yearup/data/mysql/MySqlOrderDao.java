package org.yearup.data.mysql;

import com.mysql.cj.x.protobuf.MysqlxPrepare;
import org.apache.ibatis.jdbc.SQL;
import org.yearup.models.*;
import org.yearup.data.ProfileDao;
import org.springframework.stereotype.Component;
import org.yearup.data.OrderDao;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@Component
public class MySqlOrderDao extends MySqlDaoBase implements OrderDao {

    public MySqlOrderDao(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public Order createOrder(int userId) {
        ShoppingCart shoppingCart = new ShoppingCart();
        int hashMapKey = 1;
        Map<Integer, ShoppingCartItem> items = new HashMap<>();
        Map<Integer, Integer> productQuantities = new HashMap<>();
        Map<Integer, BigDecimal> productPrices = new HashMap<>();

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
                productQuantities.put(resultSet.getInt("product_id"), 1);
                productPrices.put(resultSet.getInt("product_id"), BigDecimal.ZERO);
            }

        } catch (SQLException e) {
            System.out.println("Error trying to get your cart " +
                    e.getMessage());
        }
        Order order = new Order();
        sql = """
                SELECT * FROM videogamestore.profiles
                LEFT JOIN videogamestore.shopping_cart
                ON profiles.user_id = shopping_cart.user_id;""";

        try (Connection connection = getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql);
             ResultSet resultSet = preparedStatement.executeQuery()) {

            while (resultSet.next()) {
                order.setUserId(userId);
                order.setCity(resultSet.getString("city"));
                order.setAddress(resultSet.getString("address"));
                order.setDate(resultSet.getDate("date"));
                order.setState(resultSet.getString("state"));
                order.setZip(resultSet.getString("zip"));
                order.setShippingAmount(shoppingCart.getTotal());
            }
        } catch (SQLException e) {
            System.out.println("Error trying to complete your order " +
                    e.getMessage());
        }

        sql = """
                INSERT INTO orders(user_id, date, address, city, state, zip, shipping_amount)
                VALUES (?, ?, ?, ?, ?, ?, ?);""";

        try (Connection connection = getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {
            preparedStatement.setInt(1, userId);
            preparedStatement.setDate(2, order.getDate());
            preparedStatement.setString(3, order.getAddress());
            preparedStatement.setString(4, order.getCity());
            preparedStatement.setString(5, order.getState());
            preparedStatement.setString(6, order.getZip());
            preparedStatement.setBigDecimal(7, order.getShippingAmount());

            preparedStatement.executeUpdate();

        } catch (SQLException e) {
            System.out.println("Error trying to connect orders to data base " +
                    e.getMessage());
        }

        try (Connection connection = getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql);
             ResultSet resultSet = preparedStatement.executeQuery()) {

            while (resultSet.next()) {
                order.setOrderId(resultSet.getInt("order_id"));
            }
        } catch (SQLException e) {
            System.out.println("Error trying to get order id " +
                    e.getMessage());
        }

        OrderLineItem orderLineItem = new OrderLineItem();
        sql = """
                SELECT * FROM videogamestore.profiles
                LEFT JOIN videogamestore.shopping_cart
                ON profiles.user_id = shopping_cart.user_id;""";
        hashMapKey = 1;
        try (Connection connection = getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql);
             ResultSet resultSet = preparedStatement.executeQuery()) {

            while (resultSet.next()) {
                orderLineItem.setOrderId(order.getOrderId());
                orderLineItem.setQuantity(shoppingCart.getItems().get(hashMapKey).getQuantity());
                orderLineItem.setDiscount(orderLineItem.getDiscount());
                orderLineItem.setProductId(shoppingCart.getItems().get(hashMapKey).getProductId());
                orderLineItem.setSalesPrice(shoppingCart.getItems().get(hashMapKey).getLineTotal());
                productQuantities.replace(shoppingCart.getItems().get(hashMapKey).getProductId(), 1, shoppingCart.getItems().get(hashMapKey).getQuantity());
                productPrices.replace(shoppingCart.getItems().get(hashMapKey).getProductId(), BigDecimal.ZERO, shoppingCart.getItems().get(hashMapKey).getLineTotal().divide(BigDecimal.valueOf(shoppingCart.getItems().get(hashMapKey).getQuantity())));
                sql = """
                        INSERT INTO videogamestore.order_line_items(order_id, product_id, sales_price, quantity, discount)
                        VALUES (?, ?, ?, ?, ?;""";
                try (Connection connection1 = getConnection();
                PreparedStatement preparedStatement1 = connection.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {
                    preparedStatement1.setInt(1, order.getOrderId());
                    preparedStatement.setInt(2, shoppingCart.getItems().get(hashMapKey).getProductId());
                    preparedStatement.setBigDecimal(3, productPrices.get(shoppingCart.getItems().get(hashMapKey).getProductId()));
                    preparedStatement.setInt(4, productQuantities.get(shoppingCart.getItems().get(hashMapKey).getProductId()));
                    preparedStatement.setBigDecimal(5, orderLineItem.getDiscount());

                    preparedStatement.executeUpdate();
                }
            }
        } catch (SQLException e) {
            System.out.println("Error trying to create order line item " +
                    e.getMessage());
        }


        return order;
    }

}
