class AddSizeToPhotos < ActiveRecord::Migration
  def self.up
    add_column :photos, :size, :string
  end

  def self.down
    remove_column :photos, :size
  end
end
