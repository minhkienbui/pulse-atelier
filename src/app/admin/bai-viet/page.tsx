"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Check,
  X,
  Globe,
  FileLock2,
} from "lucide-react";
import { BLOGS } from "@/lib/mock-data";
import { generateSlug, getRelativeTime } from "@/lib/utils";

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  views: number;
  isPublished: boolean;
  createdAt: string;
  author: { name: string };
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>(BLOGS as BlogItem[]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImage, setFormImage] = useState("");

  const filtered = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingBlog(null);
    setFormTitle("");
    setFormExcerpt("");
    setFormContent("");
    setFormImage("");
    setIsModalOpen(true);
  };

  const openEditModal = (blog: BlogItem) => {
    setEditingBlog(blog);
    setFormTitle(blog.title);
    setFormExcerpt(blog.excerpt);
    setFormContent("");
    setFormImage(blog.image);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const slug = generateSlug(formTitle);
    // Check duplicate slug
    const existingSlugs = blogs
      .filter((b) => b.id !== editingBlog?.id)
      .map((b) => b.slug);

    let finalSlug = slug;
    let counter = 1;
    while (existingSlugs.includes(finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    if (editingBlog) {
      setBlogs(
        blogs.map((b) =>
          b.id === editingBlog.id
            ? { ...b, title: formTitle, slug: finalSlug, excerpt: formExcerpt, image: formImage }
            : b
        )
      );
    } else {
      const newBlog: BlogItem = {
        id: String(Date.now()),
        title: formTitle,
        slug: finalSlug,
        excerpt: formExcerpt,
        image: formImage || "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800",
        views: 0,
        isPublished: false,
        createdAt: new Date().toISOString(),
        author: { name: "Admin" },
      };
      setBlogs([newBlog, ...blogs]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setBlogs(blogs.filter((b) => b.id !== id));
    setDeleteConfirm(null);
  };

  const togglePublish = (id: string) => {
    setBlogs(
      blogs.map((b) =>
        b.id === id ? { ...b, isPublished: !b.isPublished } : b
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="heading-serif text-2xl text-ivory">Quản Lý Bài Viết</h1>
          <p className="text-sm text-ivory/40 mt-1">{blogs.length} bài viết</p>
        </div>
        <button onClick={openCreateModal} className="btn-gold text-xs py-2.5 px-5">
          <Plus size={16} />
          Thêm Bài Viết
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25" />
        <input
          type="text"
          placeholder="Tìm kiếm bài viết..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-dark-card border border-dark-border/30 rounded-lg text-ivory placeholder:text-ivory/20"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-dark-border/30 bg-dark-card/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border/20 bg-dark-card/50">
                <th className="text-left py-3.5 px-5 text-[10px] font-semibold text-ivory/30 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="text-left py-3.5 px-5 text-[10px] font-semibold text-ivory/30 uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="text-center py-3.5 px-5 text-[10px] font-semibold text-ivory/30 uppercase tracking-wider">
                  Lượt xem
                </th>
                <th className="text-center py-3.5 px-5 text-[10px] font-semibold text-ivory/30 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="text-left py-3.5 px-5 text-[10px] font-semibold text-ivory/30 uppercase tracking-wider">
                  Ngày đăng
                </th>
                <th className="text-right py-3.5 px-5 text-[10px] font-semibold text-ivory/30 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((blog) => (
                <tr
                  key={blog.id}
                  className="border-b border-dark-border/10 hover:bg-white/[0.01] transition-colors"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-surface shrink-0">
                        <Image
                          src={blog.image}
                          alt={blog.title}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-ivory/80 font-medium truncate max-w-[250px]">
                          {blog.title}
                        </p>
                        <p className="text-[10px] text-ivory/25 font-mono truncate">
                          /{blog.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-sm text-ivory/40">
                    {blog.author.name}
                  </td>
                  <td className="py-3.5 px-5 text-sm text-ivory/40 text-center">
                    <span className="flex items-center justify-center gap-1">
                      <Eye size={12} />
                      {blog.views.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <button
                      onClick={() => togglePublish(blog.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold border cursor-pointer transition-colors ${
                        blog.isPublished
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20"
                      }`}
                    >
                      {blog.isPublished ? (
                        <>
                          <Globe size={10} /> Đã đăng
                        </>
                      ) : (
                        <>
                          <FileLock2 size={10} /> Bản nháp
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-5 text-sm text-ivory/30">
                    {getRelativeTime(blog.createdAt)}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(blog)}
                        className="p-2 rounded-lg text-ivory/30 hover:text-gold hover:bg-gold/5 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(blog.id)}
                        className="p-2 rounded-lg text-ivory/30 hover:text-red-400 hover:bg-red-400/5 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-dark-card border border-dark-border/50 rounded-2xl shadow-dark-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-dark-border/20">
                <h3 className="text-lg font-semibold text-ivory heading-serif">
                  {editingBlog ? "Chỉnh Sửa Bài Viết" : "Thêm Bài Viết Mới"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg text-ivory/30 hover:text-ivory/60 hover:bg-white/[0.03] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-medium text-ivory/50 mb-1.5">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Nhập tiêu đề bài viết..."
                    className="w-full px-4 py-2.5 text-sm bg-dark-bg/50 border border-dark-border/50 rounded-lg text-ivory placeholder:text-ivory/20"
                  />
                  {formTitle && (
                    <p className="mt-1 text-[10px] text-ivory/25 font-mono">
                      Slug: {generateSlug(formTitle)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-ivory/50 mb-1.5">
                    Tóm tắt
                  </label>
                  <textarea
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    placeholder="Nhập tóm tắt ngắn gọn..."
                    rows={2}
                    className="w-full px-4 py-2.5 text-sm bg-dark-bg/50 border border-dark-border/50 rounded-lg text-ivory placeholder:text-ivory/20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ivory/50 mb-1.5">
                    Nội dung
                  </label>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Nhập nội dung bài viết..."
                    rows={8}
                    className="w-full px-4 py-2.5 text-sm bg-dark-bg/50 border border-dark-border/50 rounded-lg text-ivory placeholder:text-ivory/20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ivory/50 mb-1.5">
                    URL Ảnh bìa
                  </label>
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 text-sm bg-dark-bg/50 border border-dark-border/50 rounded-lg text-ivory placeholder:text-ivory/20"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-dark-border/20">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn-dark text-xs"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formTitle}
                  className="btn-gold text-xs py-2.5 px-6 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Check size={14} />
                  {editingBlog ? "Lưu Thay Đổi" : "Tạo Bài Viết"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 bg-dark-card border border-dark-border/50 rounded-2xl shadow-dark-lg text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-ivory mb-2">Xóa bài viết?</h3>
              <p className="text-sm text-ivory/40 mb-6">
                Hành động này không thể hoàn tác. Bài viết sẽ bị xóa vĩnh viễn.
              </p>
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-dark text-xs px-6"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
