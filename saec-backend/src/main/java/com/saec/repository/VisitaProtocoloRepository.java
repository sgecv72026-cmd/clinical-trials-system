package com.saec.repository;

import com.saec.entity.VisitaProtocolo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VisitaProtocoloRepository extends JpaRepository<VisitaProtocolo, Integer> {

    List<VisitaProtocolo> findByProtocoloIdProtocoloAndActivoTrueOrderBySemanaAscDiaAsc(Integer idProtocolo);
}
