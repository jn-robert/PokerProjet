<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use Twig\Environment;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

class UserController extends Controller
{
    /**
     * @Route("/user", name="user.index", methods={"GET"})
     * @Security("has_role('ROLE_USER')")
     */
    public function index(Request $request, Environment $twig): Response
    {
        return new Response($twig->render('base.html.twig'));
    }
}