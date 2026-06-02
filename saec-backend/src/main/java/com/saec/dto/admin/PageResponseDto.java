package com.saec.dto.admin;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

@Getter
@Builder
public class PageResponseDto<T> {
    private List<T> content;
    private int  page;
    private int  size;
    private long totalElements;
    private int  totalPages;
    private boolean first;
    private boolean last;

    public static <E, D> PageResponseDto<D> from(Page<E> page, Function<E, D> mapper) {
        return PageResponseDto.<D>builder()
                .content(page.getContent().stream().map(mapper).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}
