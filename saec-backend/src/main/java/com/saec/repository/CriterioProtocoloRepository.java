package com.saec.repository;

import com.saec.entity.CriterioProtocolo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CriterioProtocoloRepository extends JpaRepository<CriterioProtocolo, Integer> {

    List<CriterioProtocolo> findByProtocoloIdProtocoloAndActivoTrue(Integer idProtocolo);
}
