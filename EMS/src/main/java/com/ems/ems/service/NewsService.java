package com.ems.ems.service;

import com.ems.ems.dto.NewsDTO;
import com.ems.ems.model.News;
import com.ems.ems.model.NewsStatus;
import com.ems.ems.repository.NewsRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NewsService {

    @Autowired
    private NewsRepository newsRepository;

    public NewsDTO createNews(NewsDTO newsDTO) {
        News news = new News();
        BeanUtils.copyProperties(newsDTO, news);
        news.setStatus(NewsStatus.ACTIVE);
        news = newsRepository.save(news);
        BeanUtils.copyProperties(news, newsDTO);
        return newsDTO;
    }

    public NewsDTO updateNews(Long id, NewsDTO newsDTO) {
        News existingNews = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found"));
        
        BeanUtils.copyProperties(newsDTO, existingNews, "id", "createdAt");
        existingNews = newsRepository.save(existingNews);
        BeanUtils.copyProperties(existingNews, newsDTO);
        return newsDTO;
    }

    public void deleteNews(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found"));
        news.setStatus(NewsStatus.INACTIVE);
        newsRepository.save(news);
    }

    public NewsDTO getNewsById(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found"));
        NewsDTO newsDTO = new NewsDTO();
        BeanUtils.copyProperties(news, newsDTO);
        return newsDTO;
    }

    public List<NewsDTO> getAllActiveNews() {
        List<News> newsList = newsRepository.findByStatusOrderByCreatedAtDesc(NewsStatus.ACTIVE);
        return newsList.stream()
                .map(news -> {
                    NewsDTO newsDTO = new NewsDTO();
                    BeanUtils.copyProperties(news, newsDTO);
                    return newsDTO;
                })
                .collect(Collectors.toList());
    }

    public List<NewsDTO> getAllNews() {
        List<News> newsList = newsRepository.findAll();
        return newsList.stream()
                .map(news -> {
                    NewsDTO newsDTO = new NewsDTO();
                    BeanUtils.copyProperties(news, newsDTO);
                    return newsDTO;
                })
                .collect(Collectors.toList());
    }
} 