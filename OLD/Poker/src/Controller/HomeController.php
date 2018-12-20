<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use Twig\Environment;

class HomeController extends Controller
{
    /**
     * @Route("/", name="home.index", methods={"GET"})
     */
    public function index(Request $request, Environment $twig): Response
    {
        return new Response($twig->render('base.html.twig'));
    }
}