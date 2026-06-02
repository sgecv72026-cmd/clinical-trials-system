package com.saec.repository;

import com.saec.entity.MedicacionHabitual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicacionHabitualRepository extends JpaRepository<MedicacionHabitual, Integer> {
    List<MedicacionHabitual> findByPacienteIdPacienteAndActivoTrueOrderByFechaRegistroDesc(Integer idPaciente);
}
