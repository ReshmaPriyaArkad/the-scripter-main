-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 01, 2023 at 12:52 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `scripter`
--

-- --------------------------------------------------------

--
-- Table structure for table `logincredentials`
--

CREATE TABLE `logincredentials` (
  `time` timestamp NOT NULL DEFAULT current_timestamp(),
  `mailid` varchar(150) NOT NULL,
  `username` varchar(150) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `password` varchar(60) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `logincredentials`
--

INSERT INTO `logincredentials` (`time`, `mailid`, `username`, `password`) VALUES
('2022-12-26 06:41:15', 'arshadkareem272@gmail.com', 'Arshad', 'Arsh@d272'),
('2022-12-26 07:20:37', 'arshadofficial272@gmail.com', 'admin', '1234');

-- --------------------------------------------------------

--
-- Table structure for table `tokens`
--

CREATE TABLE `tokens` (
  `mailid` varchar(50) NOT NULL,
  `token` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tokens`
--

INSERT INTO `tokens` (`mailid`, `token`) VALUES
('arshadkareem272@gmail.com', '9BO1g3RSTW7DdL4yb0bY'),
('arshadkareem272@gmail.com', 'WlPzmpj5AWOGY46o9MpY'),
('arshadkareem272@gmail.com', 'LaKMJObpTDeHkUqAnkUE'),
('arshadkareem272@gmail.com', 'CJE8ccvQDoCBDE0Zwo2P'),
('arshadkareem272@gmail.com', 'l1Emv8WeJqU3SLPkSlwh'),
('arshadkareem272@gmail.com', 'OXzTDlO42qZEDP0VbDHZ');

-- --------------------------------------------------------

--
-- Table structure for table `userfiles`
--

CREATE TABLE `userfiles` (
  `time` timestamp NOT NULL DEFAULT current_timestamp(),
  `mailId` varchar(150) NOT NULL,
  `fileName` varchar(150) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `status` varchar(15) NOT NULL DEFAULT 'Not Running'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `userfiles`
--

INSERT INTO `userfiles` (`time`, `mailId`, `fileName`, `status`) VALUES
('2022-12-26 07:20:49', 'arshadofficial272@gmail.com', 'tom_cat2_m_arshadofficial272_m_.py', 'Not Running'),
('2023-02-08 07:17:10', 'arshadkareem272@gmail.com', 'abstraction_m_arshadkareem272_m_.java', 'Not Running'),
('2023-02-09 09:47:33', 'arshadkareem272@gmail.com', 'results_m_arshadkareem272_m_.py', 'Not Running');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `logincredentials`
--
ALTER TABLE `logincredentials`
  ADD PRIMARY KEY (`time`);

--
-- Indexes for table `userfiles`
--
ALTER TABLE `userfiles`
  ADD PRIMARY KEY (`time`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
