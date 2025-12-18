package org.yearup.data.mysql;

import com.mysql.cj.x.protobuf.MysqlxPrepare;
import org.apache.ibatis.jdbc.SQL;
import org.springframework.beans.factory.annotation.Autowired;
import org.yearup.data.ShoppingCartDao;
import org.yearup.models.*;
import org.yearup.data.ProfileDao;
import org.springframework.stereotype.Component;
import org.yearup.data.OrderDao;

import javax.sql.DataSource;
import javax.xml.transform.Result;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@Component
public class MySqlOrderDao extends MySqlDaoBase implements OrderDao {

    @Autowired
    public MySqlOrderDao(DataSource dataSource, ShoppingCartDao shoppingCartDao, ProfileDao profileDao) {
        super(dataSource);
    }

    @Override
    public Order createOrder(int userId, Profile profile, ShoppingCart shoppingCart) {
        Order order = new Order();
        String sql = """
                INSERT INTO videogamestore.orders(user_id, date, address, city, state, zip, shipping_amount)
                VALUES (?, ?, ?, ?, ?, ?, ?);""";

        try (Connection connection = getConnection();
        PreparedStatement preparedStatement = connection.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {
            preparedStatement.setInt(1, userId);
            preparedStatement.setDate(2, order.getDate());
            preparedStatement.setString(3, profile.getAddress());
            preparedStatement.setString(4, profile.getCity());
            preparedStatement.setString(5, profile.getState());
            preparedStatement.setString(6, profile.getZip());
            preparedStatement.setBigDecimal(7, shoppingCart.getTotal());

            int rowsAffected = preparedStatement.executeUpdate();

            if (rowsAffected > 0) {
                ResultSet generatedKeys = preparedStatement.getGeneratedKeys();

                if (generatedKeys.next()) {
                    int orderId = generatedKeys.getInt(1);

                    return getByOrderId(orderId);
                }
            }
        } catch (SQLException e) {
            System.out.println("Error trying to complete your order " +
                    e.getMessage());
        }
        return null;
    }

    public Order getByOrderId(int orderId) {
        String sql = """
                SELECT * FROM videogamestore.orders
                WHERE order_id = ?;""";

        try (Connection connection = getConnection();
        PreparedStatement preparedStatement = connection.prepareStatement(sql)) {
            preparedStatement.setInt(1, orderId);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                while(resultSet.next()) {
                   Order order = new Order(
                           orderId,
                           resultSet.getInt("user_id"),
                           resultSet.getDate("date"),
                           resultSet.getString("address"),
                           resultSet.getString("city"),
                           resultSet.getString("state"),
                           resultSet.getString("zip"),
                           resultSet.getBigDecimal("shipping_amount")
                   );
                   return order;
                }
            }
        } catch (SQLException e) {
            System.out.println("Error in back end finding your order " +
                    e.getMessage());
        }
        return null;
    }

}
