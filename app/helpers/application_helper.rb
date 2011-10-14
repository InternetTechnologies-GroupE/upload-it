module ApplicationHelper
  def upload_path(folder, source)
    compute_public_path(source, "uploads"+"/"+folder)
  end
end
