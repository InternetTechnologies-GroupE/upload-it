class CreatePhotos < ActiveRecord::Migration
  def self.up
    create_table :photos do |t|
      t.string :filename
      t.integer :user_id
      t.string :title
      t.text :description
      t.boolean :public
      t.date :date

      t.timestamps
    end
  end

  def self.down
    drop_table :photos
  end
end
