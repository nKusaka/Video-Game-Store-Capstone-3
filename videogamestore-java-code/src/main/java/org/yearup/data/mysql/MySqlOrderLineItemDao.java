package org.yearup.data.mysql;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.yearup.data.OrderDao;
import org.yearup.data.OrderLineItemDao;
import org.yearup.data.ShoppingCartDao;
import org.yearup.models.Order;
import org.yearup.models.OrderLineItem;
import org.yearup.models.ShoppingCart;
import org.yearup.models.ShoppingCartItem;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class MySqlOrderLineItemDao extends MySqlDaoBase implements OrderLineItemDao {

    @Autowired
    public MySqlOrderLineItemDao(DataSource dataSource, ShoppingCartDao shoppingCartDao, OrderDao orderDao) {
        super(dataSource);
    }

    @Override
    public void create(int productId, int orderId, ShoppingCartItem shoppingCartItem) {
        String sql = """
                INSERT INTO order_line_items(order_id, product_id, sales_price, quantity, discount)
                VALUES (?, ?, ?, ?, ?);""";

        try (Connection connection = getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {
            preparedStatement.setInt(1, orderId);
            preparedStatement.setInt(2, productId);
            preparedStatement.setBigDecimal(3, shoppingCartItem.getLineTotal());
            preparedStatement.setInt(4, shoppingCartItem.getQuantity());
            preparedStatement.setBigDecimal(5, shoppingCartItem.getDiscountPercent());

            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error in back end creating order line item " +
                    e.getMessage());
        }
    }
}
