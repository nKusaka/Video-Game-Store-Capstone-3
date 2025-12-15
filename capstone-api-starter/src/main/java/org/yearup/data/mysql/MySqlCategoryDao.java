package org.yearup.data.mysql;

import org.apache.commons.dbcp2.BasicDataSource;
import org.springframework.stereotype.Component;
import org.yearup.data.CategoryDao;
import org.yearup.models.Category;

import javax.sql.DataSource;
import javax.websocket.RemoteEndpoint;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class MySqlCategoryDao extends MySqlDaoBase implements CategoryDao {
    private final BasicDataSource basicDataSource;

    public MySqlCategoryDao(DataSource dataSource, BasicDataSource basicDataSource) {
        super(dataSource);
        this.basicDataSource = basicDataSource;
    }

    @Override
    public List<Category> getAllCategories() {
        List<Category> categories = new ArrayList<>();

        String sql = "SELECT * FROM videogamestore.categories;";

        try (Connection connection = basicDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql);
             ResultSet resultSet = preparedStatement.executeQuery()) {

            while (resultSet.next()) {
                Category category = new Category(
                        resultSet.getInt("category_id"),
                        resultSet.getString("name"),
                        resultSet.getString("description")
                );
                categories.add(category);
            }
        } catch (SQLException e) {
            System.out.println("Error fetching categories " +
                    e.getMessage());
        }
        return categories;
    }

    @Override
    public Category getById(int categoryId) {
        Category category = new Category();
        String sql = "SELECT * FROM videogamestore.categories " +
                "WHERE category_id = ?;";

        try (Connection connection = basicDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setInt(1, categoryId);


            try (ResultSet resultSet = preparedStatement.executeQuery()) {

                if (resultSet.next()) {
                    category.setCategoryId(resultSet.getInt("category_id"));
                    category.setName(resultSet.getString("name"));
                    category.setDescription(resultSet.getString("description"));
                }
            }

        } catch (SQLException e) {
            System.out.println("Error fetching specific category id " +
                    e.getMessage());
        }
        return category;
    }

    @Override
    public Category create(Category category) {
        String sql = """
                INSERT INTO videogamestore.categories (name, description)
                VALUES (?, ?);""";

        try (Connection connection = basicDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setString(1, category.getName());
            preparedStatement.setString(2, category.getDescription());

            try (ResultSet resultSet = preparedStatement.executeQuery()){

            }
        } catch (SQLException e) {
            System.out.println("Error trying to create new category " +
                    e.getMessage());
        }
        return category;
    }

    @Override
    public void update(int categoryId, Category category) {
        // update category
    }

    @Override
    public void delete(int categoryId) {
        // delete category
    }

    private Category mapRow(ResultSet row) throws SQLException {
        int categoryId = row.getInt("category_id");
        String name = row.getString("name");
        String description = row.getString("description");

        Category category = new Category() {{
            setCategoryId(categoryId);
            setName(name);
            setDescription(description);
        }};

        return category;
    }

}
