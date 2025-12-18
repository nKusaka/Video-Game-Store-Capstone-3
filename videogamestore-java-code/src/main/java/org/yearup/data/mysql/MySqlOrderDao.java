package org.yearup.data.mysql;

import com.mysql.cj.x.protobuf.MysqlxPrepare;
import org.yearup.models.Profile;
import org.yearup.data.ProfileDao;
import org.springframework.stereotype.Component;
import org.yearup.data.OrderDao;
import org.yearup.models.Order;
import org.yearup.models.ShoppingCart;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

@Component
public class MySqlOrderDao extends MySqlDaoBase implements OrderDao {

    public MySqlOrderDao(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public Order createOrder(int userId) {
        Order order = new Order();
        String sql = "INSERT INTO orders(user_id, date, address, city, state, zip, shipping_amount) " +
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?);";

        try (Connection connection = getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {
            preparedStatement.setInt(1, profile.getUserId());
            preparedStatement.setDate(2, order.getDate());
            preparedStatement.setString(3, profile.getAddress());
            preparedStatement.setString(4, profile.getCity());
            preparedStatement.setString(5, profile.getState());
            preparedStatement.setString(6, profile.getZip());
            preparedStatement.setBigDecimal(7, shoppingCart.getTotal());

            preparedStatement.executeUpdate();

            return order;
        } catch (SQLException e) {
            System.out.println("Error trying to create order " +
                    e.getMessage());
        }
        return null;
    }

}
